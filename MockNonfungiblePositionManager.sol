// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

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

    // The mint function returns a tokenId, liquidity, and the amounts used.
    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );

    // A positions function to return details about a minted position.
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

contract MockNonfungiblePositionManager is INonfungiblePositionManager {
    uint256 public nextTokenId = 1;

    struct Position {
        uint96 nonce;
        address operator;
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    mapping(uint256 => Position) public positionsData;

    function mint(MintParams calldata params)
        external
        payable
        override
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        require(params.amount0Desired > 0 && params.amount1Desired > 0, "Amounts must be > 0");
        require(block.timestamp <= params.deadline, "Deadline passed");

        tokenId = nextTokenId++;
        // For simulation, we assume the entire desired amounts are used.
        amount0 = params.amount0Desired;
        amount1 = params.amount1Desired;
        // For demonstration, assign a dummy liquidity value.
        liquidity = 1000000;

        // Save a new position with minimal details.
        positionsData[tokenId] = Position({
            nonce: 0,
            operator: msg.sender,
            token0: params.token0,
            token1: params.token1,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            liquidity: liquidity,
            feeGrowthInside0LastX128: 0,
            feeGrowthInside1LastX128: 0,
            tokensOwed0: 0,
            tokensOwed1: 0
        });
    }

    function positions(uint256 tokenId) external view override returns (
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
    ) {
        Position storage pos = positionsData[tokenId];
        return (
            pos.nonce,
            pos.operator,
            pos.token0,
            pos.token1,
            pos.fee,
            pos.tickLower,
            pos.tickUpper,
            pos.liquidity,
            pos.feeGrowthInside0LastX128,
            pos.feeGrowthInside1LastX128,
            pos.tokensOwed0,
            pos.tokensOwed1
        );
    }
}
