pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract GovernanceToken is ERC20Votes {
    uint256 public s_maxSupply = 1000000000000000000000000;

    constructor()
        ERC20("Governance Token", "GT")
        ERC20Permit("Governance Token")
    {
        _mint(msg.sender, s_maxSupply);
    }

    function _afterTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal override(ERC20Votes) {
        super._afterTokenTransfer(_from, _to, _amount);
    }

    function _mint(address _to, uint256 _amount) internal override(ERC20Votes) {
        super._mint(_to, _amount);
    }

    function _burn(address _to, uint256 _amount) internal override(ERC20Votes) {
        super._burn(_to, _amount);
    }
}
