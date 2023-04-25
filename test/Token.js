const { expect } = require("chai");
const {ethers} = require("hardhat");

describe("Governance Smart Contracts", function () {
  let GovernanceToken, TimeLock, GovernorContract;
  let governanceToken, timeLock, governorContract;
  let owner, proposer, executor, voter1, voter2, voter3, newAdmin;

  beforeEach(async function () {
    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    TimeLock = await ethers.getContractFactory("TimeLock");
    GovernorContract = await ethers.getContractFactory("GovernorContract");

    [owner, proposer, executor, voter1, voter2, voter3, newAdmin] =
      await ethers.getSigners();

    governanceToken = await GovernanceToken.deploy();
    await governanceToken.deployed();

    const minDelay = 60 * 60 * 24 * 2; // 2 days in seconds
    timeLock = await TimeLock.deploy(owner.address, minDelay, [proposer.address], [executor.address]);
    await timeLock.deployed();

    const quorumPercentage = 20; // 20%
    const votingPeriod = 60 * 60 * 24 * 7; // 7 days in seconds
    const votingDelay = 1; // 1 block
    governorContract = await GovernorContract.deploy(governanceToken.address, timeLock.address, quorumPercentage, votingPeriod, votingDelay);
    await governorContract.deployed();
  });

  describe("GovernanceToken", function () {
    it("Should deploy the GovernanceToken with the correct supply", async function () {
      const maxSupply = await governanceToken.s_maxSupply();
      expect(maxSupply).to.equal(ethers.utils.parseEther("1000000"));
    });

    it("Should transfer tokens correctly", async function () {
      await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
      const balance = await governanceToken.balanceOf(voter1.address);
      expect(balance).to.equal(ethers.utils.parseEther("100"));
    });
  });

  describe("TimeLock", function () {
    it("should set minDelay correctly", async function () {
      expect(await timeLock.getMinDelay()).to.equal(60 * 60 * 24 * 2);
    });
    
    it("Should prevent non-admin from transferring ownership", async function () {
      const tx = timeLock.connect(voter1).transferOwnership(voter2.address);
      await expect(tx).to.be.revertedWith("Only Admin authorized");
    });
  
  });
});
          
