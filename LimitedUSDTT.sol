pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LimitedUSDTT is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 25_000_000_000 * 1e6; // 25B tokens (6 decimales como USDT)
    mapping(address => uint256) public transferCount;

    constructor() ERC20("Limited USDT Token", "USDTT") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        // Solo aplica límite si el remitente es el dueño (distribución inicial)
        if (msg.sender == owner()) {
            require(transferCount[to] < 3, "Limite de 3 transferencias por direccion alcanzado");
            transferCount[to] += 1;
        }
        return super.transfer(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // El límite solo aplica a transferencias directas del owner
        if (from == owner()) {
            require(transferCount[to] < 3, "Limite de 3 transferencias por direccion alcanzado");
            transferCount[to] += 1;
        }
        return super.transferFrom(from, to, amount);
    }
}
