pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public constant s_maxSupply = 1000000000000000000000000;

    constructor()
        ERC20("Governance Token", "GT")
        ERC20Permit("Governance Token")
    {
        _mint(msg.sender, s_maxSupply);
    }
}
