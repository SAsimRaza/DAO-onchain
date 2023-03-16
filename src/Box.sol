pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Box {
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    uint256 private value;

    function store(uint256 _value) external {
        emit ValueUpdated(value, value = _value);
    }

    function retrieve() external view returns (uint256) {
        return value;
    }
}
