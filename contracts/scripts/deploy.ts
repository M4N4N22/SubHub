import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  //
  // STEP 1: CreatorProfile
  //
  console.log("STEP 1: CreatorProfile…");
  const CreatorProfile = await ethers.getContractFactory("CreatorProfile");
  const creatorProfile = await CreatorProfile.deploy();
  await creatorProfile.deployed();
  console.log("CreatorProfile deployed at:", creatorProfile.address);

  //
  // STEP 2: SubscriptionPlan
  //
  console.log("STEP 2: SubscriptionPlan…");
  const SubscriptionPlan = await ethers.getContractFactory("SubscriptionPlan");
  const subscriptionPlan = await SubscriptionPlan.deploy();
  await subscriptionPlan.deployed();
  console.log("SubscriptionPlan deployed at:", subscriptionPlan.address);

  //
  // STEP 3: PaymentManager (needs SubscriptionPlan + USDC)
  //
  console.log("STEP 3: PaymentManager…");
  const usdcAddress = "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359"; // Amoy USDC
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy(
    subscriptionPlan.address,
    usdcAddress
  );
  await paymentManager.deployed();
  console.log("PaymentManager deployed at:", paymentManager.address);

  //
  // STEP 4: MembershipNFT
  //
  console.log("STEP 4: MembershipNFT…");
  const MembershipNFT = await ethers.getContractFactory("MembershipNFT");
  const membershipNFT = await MembershipNFT.deploy();
  await membershipNFT.deployed();
  console.log("MembershipNFT deployed at:", membershipNFT.address);

  //
  // STEP 5: ContentGating (needs PaymentManager + MembershipNFT)
  //
  console.log("STEP 5: ContentGating…");
  const ContentGating = await ethers.getContractFactory("ContentGating");
  const contentGating = await ContentGating.deploy(
    paymentManager.address,
    membershipNFT.address
  );
  await contentGating.deployed();
  console.log("ContentGating deployed at:", contentGating.address);

  console.log("DONE");
}

main().catch((err) => {
  console.error("SCRIPT ERROR:", err);
  process.exit(1);
});
