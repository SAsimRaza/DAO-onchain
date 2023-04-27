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

    it("should update voting power after delegation", async () => {
      await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
      await governanceToken.connect(voter1).delegate(voter2.address);
      const voter2VotingPower = await governanceToken.getVotes(voter2.address);
      expect(voter2VotingPower).to.equal(ethers.utils.parseEther("100"));
    });
  
  });

  describe("Deployment", () => {
    it("should set the correct name and symbol", async () => {
      expect(await governanceToken.name()).to.equal("Governance Token");
      expect(await governanceToken.symbol()).to.equal("GT");
    });

    it("should set the initial total supply to 1,000,000 tokens", async () => {
      const totalSupply = await governanceToken.totalSupply();
      expect(totalSupply).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    });

    it("should mint all tokens to the contract deployer", async () => {
      const ownerBalance = await governanceToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    });
  });

  describe("Voting", () => {
    it("should allow delegation of voting power", async () => {
      await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
      await governanceToken.connect(voter1).delegate(owner.address);
      const ownerVotingPower = await governanceToken.getVotes(owner.address);
      expect(ownerVotingPower).to.equal(ethers.utils.parseEther("100"));
    });

    it("should update voting power after delegation", async () => {
      await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
      await governanceToken.connect(voter1).delegate(voter2.address);
      const voter2VotingPower = await governanceToken.getVotes(voter2.address);
      expect(voter2VotingPower).to.equal(ethers.utils.parseEther("100"));
    });
  });

  describe("Transfers", () => {
    it("should transfer tokens between accounts", async () => {
      await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
      const voter1Balance = await governanceToken.balanceOf(voter1.address);
      expect(voter1Balance).to.equal(ethers.utils.parseEther("100"));

      await governanceToken.connect(voter1).transfer(voter2.address, ethers.utils.parseEther("50"));
      const voter2Balance = await governanceToken.balanceOf(voter2.address);
      expect(voter2Balance).to.equal(ethers.utils.parseEther("50"));
    });

    it("should not transfer more tokens than the sender has", async () => {
      const initialBalance = await governanceToken.balanceOf(owner.address);
      await expect(
        governanceToken.transfer(voter1.address, initialBalance.add(ethers.utils.parseEther("1")))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    // it("should update voting power after transfer", async () => {
    //   await governanceToken.transfer(voter1.address, ethers.utils.parseEther("100"));
    //   const voter1Balance = await governanceToken.balanceOf(voter1.address);
    //   expect(voter1Balance).to.equal(ethers.utils.parseEther("100"));
    
    //   const voter1VotingPower = await governanceToken.getVotes(voter1.address);
    //   expect(voter1VotingPower).to.equal(ethers.utils.parseEther("100"));
    
    //   const adminVotingPower = await governanceToken.getVotes(admin.address);
    //   expect(adminVotingPower).to.equal(ethers.utils.parseEther("999900"));
    // });
  });
});
          
