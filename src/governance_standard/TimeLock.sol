pragma solidity ^0.8.0;
import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {
    address admin;

    event OnwershipTransferred(
        address oldAdmin,
        address newAdmin,
        uint256 timestamp
    );

    constructor(
        address _admin,
        uint256 _minDelay,
        address[] memory _proposers,
        address[] memory _executors
    ) TimelockController(_minDelay, _proposers, _executors, _admin) {
        admin = _admin;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Admin authorized ");
        _;
    }

    function transferOwnership(address _admin) external onlyAdmin {
        emit OnwershipTransferred(admin, admin = _admin, block.timestamp);
    }
}
