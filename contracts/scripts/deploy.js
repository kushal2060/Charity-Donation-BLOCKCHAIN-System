const hre = require("hardhat");

async function main() {
  console.log("Deploying CharityPlatform contract...");

  // Get the deployer account
  const signers = await hre.ethers.getSigners();
  console.log("Signers:", signers);
  const [deployer] = await hre.ethers.getSigners();
  
 
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const CharityPlatform = await hre.ethers.getContractFactory("CharityPlatform");
  
  // Use deployer address as initial fee recipientxs
  const charityPlatform = await CharityPlatform.deploy(deployer.address);

  await charityPlatform.waitForDeployment();

  console.log("CharityPlatform deployed to:", charityPlatform.target);
  console.log("Fee recipient set to:", deployer.address);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: charityPlatform.address,
    deployer: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Verify contract on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await charityPlatform.waitForDeployment();
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: charityPlatform.address,
        constructorArguments: [deployer.address],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });