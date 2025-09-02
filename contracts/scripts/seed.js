const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy contract
  const CharityPlatform = await hre.ethers.getContractFactory("CharityPlatform");
  const charityContract = await CharityPlatform.deploy(deployer.address);

  console.log("CharityPlatform deployed to:", charityContract.address);

  // Create test charities
  const charities = [
    {
      name: "Temp",
      description: "Just for testing",
      category: "Testing",
      targetAmount: "0.1",
      ipfsHash: "QmTempHash",
    },
    {
      name: "Kushal",
      description: "Support education",
      category: "Education",
      targetAmount: "1",
      ipfsHash: "QmKushalHash",
    },
    {
      name: "HealthFund",
      description: "Medical support for needy",
      category: "Health",
      targetAmount: "2",
      ipfsHash: "QmHealthHash",
    },
  ];

  for (const c of charities) {
    const tx = await charityContract.createCharity(
      deployer.address,
      c.name,
      c.description,
      c.category,
      hre.ethers.parseEther(c.targetAmount),
      c.ipfsHash
    );
    await tx.wait();
    console.log(`Created charity: ${c.name}`);
  }

  console.log("Seeded 3 test charities!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
