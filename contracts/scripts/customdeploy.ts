import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  // Reuse these existing deployments
  const subscriptionPlanAddress = "0x5D74e97d70afaF41586F3ccC75127AcAee9B37E1";
  const membershipNFTAddress = "0x5Ecc533FD2fB524c5DeDf4172556f753fBE563b2";
  const usdcAddress = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"; // Amoy USDC

  //
  // 1. Deploy PaymentManager (ONLY changed contract)
  //
  console.log("Deploying new PaymentManager...");
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(
    subscriptionPlanAddress,
    usdcAddress
  );
  await paymentManager.deployed();

  console.log("PaymentManager deployed at:", paymentManager.address);

  //
  // 2. Deploy ContentGating (MUST be updated to use new PaymentManager)
  //
  console.log("Deploying new ContentGating...");
  const ContentGating = await ethers.getContractFactory("ContentGating");
  const contentGating = await ContentGating.deploy(
    paymentManager.address,
    membershipNFTAddress
  );
  await contentGating.deployed();

  console.log("ContentGating deployed at:", contentGating.address);

  console.log("DONE");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
