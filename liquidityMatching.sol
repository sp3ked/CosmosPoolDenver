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
}

contract LiquidityMatching {
    address public wETH = 0x4200000000000000000000000000000000000006;
    address public USDC = 0x078D782b760474a361dDA0AF3839290b0EF57AD6;
    // We no longer hardcode the position manager address; it is passed in.
    address public positionManager;
    address public constant UNISWAP_V3_FACTORY = 0x1F98400000000000000000000000000000000003;

    uint256 public totalUSDCDeposited;
    uint256 public totalWETHDeposited;
    address public immutable owner;

    // Use a tick range centered around the current pool tick.
    int24 public constant TICK_LOWER = 199200;
    int24 public constant TICK_UPPER = 199260;

    struct Deposit {
        address depositor;
        uint256 amount;
        uint256 unmatchedAmount;
        uint256 timestamp;
    }

    mapping(address => Deposit) public usdcDeposits;
    mapping(address => Deposit) public wethDeposits;
    mapping(uint256 => bool) public managedPositions;

    event UsdcDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event WethDeposited(address indexed depositor, uint256 amount, uint256 timestamp);
    event LiquidityMatched(address indexed token0, address indexed token1, uint256 amount0, uint256 amount1, uint256 tokenId);
    event MatchingTriggered();

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Now the constructor accepts the position manager address.
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

        wethDeposits[msg.sender].depositor = msg.sender;
        wethDeposits[msg.sender].amount += amount;
        wethDeposits[msg.sender].unmatchedAmount += amount;
        wethDeposits[msg.sender].timestamp = block.timestamp;

        emit WethDeposited(msg.sender, amount, block.timestamp);
    }

    // The minting function that calls the position manager
    function triggerLiquidityMatching(uint256 amountUSDC, uint256 amountWETH) external {
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

        // Capture all return values from mint().
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
}
