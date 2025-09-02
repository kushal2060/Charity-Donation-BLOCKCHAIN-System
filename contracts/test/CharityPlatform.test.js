const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharityPlatform", function () {
  let CharityPlatform;
  let charityPlatform;
  let owner;
  let charity;
  let donor;
  let feeRecipient;

  beforeEach(async function () {
    [owner, charity, donor, feeRecipient] = await ethers.getSigners();
    
    CharityPlatform = await ethers.getContractFactory("CharityPlatform");
    charityPlatform = await CharityPlatform.deploy(feeRecipient.address);
    await charityPlatform.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await charityPlatform.owner()).to.equal(owner.address);
    });

    it("Should set the right fee recipient", async function () {
      expect(await charityPlatform.feeRecipient()).to.equal(feeRecipient.address);
    });
  });

  describe("Charity Creation", function () {
    it("Should create a charity successfully", async function () {
      const tx = await charityPlatform.connect(charity).createCharity(
        charity.address,
        "Test Charity",
        "A test charity for testing",
        "Education",
        ethers.utils.parseEther("10"),
        "QmTestHash"
      );

      await expect(tx)
        .to.emit(charityPlatform, "CharityCreated")
        .withArgs(1, charity.address, charity.address, "Test Charity", ethers.utils.parseEther("10"));

      const createdCharity = await charityPlatform.getCharity(1);
      expect(createdCharity.name).to.equal("Test Charity");
      expect(createdCharity.creator).to.equal(charity.address);
    });

    it("Should fail with invalid parameters", async function () {
      await expect(
        charityPlatform.createCharity(
          ethers.constants.AddressZero,
          "Test",
          "Description",
          "Category",
          ethers.utils.parseEther("10"),
          "hash"
        )
      ).to.be.revertedWith("Invalid charity wallet");
    });
  });

  describe("Charity Verification", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity).createCharity(
        charity.address,
        "Test Charity",
        "Description",
        "Education",
        ethers.utils.parseEther("10"),
        "QmTestHash"
      );
    });

    it("Should verify charity by owner", async function () {
      await expect(charityPlatform.verifyCharity(1, true))
        .to.emit(charityPlatform, "CharityVerified")
        .withArgs(1, true);

      const verifiedCharity = await charityPlatform.getCharity(1);
      expect(verifiedCharity.isVerified).to.be.true;
    });

    it("Should fail verification by non-owner", async function () {
      await expect(
        charityPlatform.connect(charity).verifyCharity(1, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Donations", function () {
    beforeEach(async function () {
      await charityPlatform.connect(charity).createCharity(
        charity.address,
        "Test Charity",
        "Description",
        "Education",
        ethers.utils.parseEther("10"),
        "QmTestHash"
      );
      await charityPlatform.verifyCharity(1, true);
    });

    it("Should accept donations to verified charity", async function () {
      const donationAmount = ethers.utils.parseEther("1");
      const platformFee = donationAmount.mul(250).div(10000); // 2.5%
      const netDonation = donationAmount.sub(platformFee);

      await expect(
        charityPlatform.connect(donor).donate(1, "Test donation", {
          value: donationAmount
        })
      ).to.emit(charityPlatform, "DonationMade")
        .withArgs(1, 1, donor.address, netDonation, "Test donation");

      const updatedCharity = await charityPlatform.getCharity(1);
      expect(updatedCharity.raisedAmount).to.equal(netDonation);
    });

    it("Should fail donation to unverified charity", async function () {
      await charityPlatform.verifyCharity(1, false);
      
      await expect(
        charityPlatform.connect(donor).donate(1, "Test", {
          value: ethers.utils.parseEther("1")
        })
      ).to.be.revertedWith("Charity not verified");
    });

    it("Should fail donation with zero amount", async function () {
      await expect(
        charityPlatform.connect(donor).donate(1, "Test", { value: 0 })
      ).to.be.revertedWith("Donation amount must be greater than 0");
    });
  });

  describe("Platform Fee", function () {
    it("Should update platform fee by owner", async function () {
      await expect(charityPlatform.updatePlatformFee(500))
        .to.emit(charityPlatform, "PlatformFeeUpdated")
        .withArgs(500);

      expect(await charityPlatform.platformFeeRate()).to.equal(500);
    });

    it("Should fail to set fee above 10%", async function () {
      await expect(
        charityPlatform.updatePlatformFee(1001)
      ).to.be.revertedWith("Fee rate cannot exceed 10%");
    });
  });
});