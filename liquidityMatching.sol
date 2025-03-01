// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    // withdrawTokens pulls token balances from the pool into a specified address.
    function withdrawTokens(address token, address to) external;

    function positions(uint256 tokenId) external view returns (
        uint96 nonce,
        address operator,
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint128 liquidity,
        uint256 feeGrowthInside0LastX128,
        uint256 feeGrowthInside1LastX128,
        uint128 tokensOwed0,
        uint128 tokensOwed1
    );
}

contract LiquidityMatching {
    address public wETH = 0x4200000000000000000000000000000000000006;
    address public USDC = 0x078D782b760474a361dDA0AF3839290b0EF57AD6;
    // The position manager address is provided via the constructor.
    address public positionManager;
    address public constant UNISWAP_V3_FACTORY = 0x1F98400000000000000000000000000000000003;

    uint256 public totalUSDCDeposited;
    uint256 public totalWETHDeposited;
    address public immutable owner;

    // Use a tick range centered around the current pool tick.
    int24 public constant TICK_LOWER = 199200;
    int24 public constant TICK_UPPER = 199260;

    uint256 public matchingTimestamp; // Timestamp when liquidity matching is triggered

    struct Deposit {
        address depositor;
        uint256 amount;
        uint256 unmatchedAmount;
        uint256 timestamp;
    }

    // Mappings to track deposits
    mapping(address => Deposit) public usdcDeposits;
    mapping(address => Deposit) public wethDeposits;

    // Arrays to allow iteration over depositors during distribution.
    address[] public usdcDepositors;
    address[] public wethDepositors;

    mapping(uint256 => bool) public managedPositions;

    event UsdcDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event WethDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event LiquidityMatched(address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 tokenId);
    event MatchingTriggered();
    event WithdrawAndDistribute(uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Constructor accepts the position manager address.
    constructor(address _weth, address _usdc, address _positionManager) {
        wETH = _weth;
        USDC = _usdc;
        owner = msg.sender;
        positionManager = _positionManager;
    }

    function getPoolFee(address _tokenA, address _tokenB, address _poolAddress)
        public
        view
        returns (uint24 poolFee)
    {
        IUniswapV3Pool pool = IUniswapV3Pool(_poolAddress);
        require(
            (pool.token0() == _tokenA && pool.token1() == _tokenB) ||
            (pool.token0() == _tokenB && pool.token1() == _tokenA),
            "Pool does not match given tokens"
        );
        return pool.fee();
    }

    function depositUSDC(uint256 amount) external {
        require(amount > 0, "Must be greater than 0");
        IERC20(USDC).transferFrom(msg.sender, address(this), amount);
        totalUSDCDeposited += amount;

        if (usdcDeposits[msg.sender].amount == 0) {
            usdcDepositors.push(msg.sender);
        }
        usdcDeposits[msg.sender].depositor = msg.sender;
        usdcDeposits[msg.sender].amount += amount;
        usdcDeposits[msg.sender].unmatchedAmount += amount;
        usdcDeposits[msg.sender].timestamp = block.timestamp;

        emit UsdcDeposited(msg.sender, amount, block.timestamp);
    }

    function depositWETH(uint256 amount) external {
        require(amount > 0, "Must be greater than 0");
        IERC20(wETH).transferFrom(msg.sender, address(this), amount);
        totalWETHDeposited += amount;

        if (wethDeposits[msg.sender].amount == 0) {
            wethDepositors.push(msg.sender);
        }
        wethDeposits[msg.sender].depositor = msg.sender;
        wethDeposits[msg.sender].amount += amount;
        wethDeposits[msg.sender].unmatchedAmount += amount;
        wethDeposits[msg.sender].timestamp = block.timestamp;

        emit WethDeposited(msg.sender, amount, block.timestamp);
    }

    // Triggers liquidity matching and records the matching timestamp.
    function triggerLiquidityMatching(uint256 amountUSDC, uint256 amountWETH) external {
        matchingTimestamp = block.timestamp;
        uint24 fee = 500; // fee tier for your pool (0.05%)
        executeLiquidityProvision(amountUSDC, amountWETH, fee);
        emit MatchingTriggered();
    }

    function executeLiquidityProvision(uint256 amountUSDC, uint256 amountWETH, uint24 poolFee)
        public
        onlyOwner
        returns (uint256 tokenId)
    {
        require(amountUSDC > 0 && amountWETH > 0, "Zero amounts");
        require(totalUSDCDeposited >= amountUSDC, "Insufficient USDC");
        require(totalWETHDeposited >= amountWETH, "Insufficient WETH");

        // Sort tokens so that token0 is the lower address.
        (address token0, address token1, uint256 amount0, uint256 amount1) = _sortTokens(amountUSDC, amountWETH);

        // Approve tokens to the position manager.
        IERC20(token0).approve(positionManager, amount0);
        IERC20(token1).approve(positionManager, amount1);

        // Construct the mint parameters using the defined tick range.
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: poolFee,
            tickLower: TICK_LOWER,
            tickUpper: TICK_UPPER,
            amount0Desired: amount0,
            amount1Desired: amount1,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp + 15 minutes
        });

        // Call mint() on the position manager.
        (uint256 _tokenId, uint128 liquidity, uint256 used0, uint256 used1) = INonfungiblePositionManager(positionManager).mint(params);
        tokenId = _tokenId;

        managedPositions[tokenId] = true;

        if (token0 == USDC) {
            totalUSDCDeposited -= used0;
            totalWETHDeposited -= used1;
        } else {
            totalUSDCDeposited -= used1;
            totalWETHDeposited -= used0;
        }

        emit LiquidityMatched(token0, token1, used0, used1, tokenId);
        return tokenId;
    }

    function _sortTokens(uint256 amountUSDC, uint256 amountWETH)
        internal
        view
        returns (address token0, address token1, uint256 amount0, uint256 amount1)
    {
        if (USDC < wETH) {
            token0 = USDC;
            token1 = wETH;
            amount0 = amountUSDC;
            amount1 = amountWETH;
        } else {
            token0 = wETH;
            token1 = USDC;
            amount0 = amountWETH;
            amount1 = amountUSDC;
        }
        return (token0, token1, amount0, amount1);
    }

    // Withdraw tokens from the pool (mock position manager) back into this contract.
    function _withdrawFromPool() internal {
        INonfungiblePositionManager(positionManager).withdrawTokens(wETH, address(this));
        INonfungiblePositionManager(positionManager).withdrawTokens(USDC, address(this));
    }

    // Withdraw and return exactly the deposited amounts to the depositors.
    function withdrawAndDistribute() external onlyOwner {
        require(matchingTimestamp > 0, "Liquidity matching not triggered");
        require(block.timestamp >= matchingTimestamp + 10 minutes, "Too early to withdraw");

        // Pull tokens from the pool back into this contract.
        _withdrawFromPool();

        // Return WETH deposits exactly as deposited.
        for (uint i = 0; i < wethDepositors.length; i++) {
            address depositor = wethDepositors[i];
            uint256 depositAmount = wethDeposits[depositor].amount;
            if (depositAmount > 0) {
                require(IERC20(wETH).transfer(depositor, depositAmount), "WETH transfer failed");
                wethDeposits[depositor].amount = 0;
                wethDeposits[depositor].unmatchedAmount = 0;
            }
        }

        // Return USDC deposits exactly as deposited.
        for (uint i = 0; i < usdcDepositors.length; i++) {
            address depositor = usdcDepositors[i];
            uint256 depositAmount = usdcDeposits[depositor].amount;
            if (depositAmount > 0) {
                require(IERC20(USDC).transfer(depositor, depositAmount), "USDC transfer failed");
                usdcDeposits[depositor].amount = 0;
                usdcDeposits[depositor].unmatchedAmount = 0;
            }
        }

        // Reset total deposit tracking.
        totalWETHDeposited = 0;
        totalUSDCDeposited = 0;

        emit WithdrawAndDistribute(block.timestamp);
    }
}
