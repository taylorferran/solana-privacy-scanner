// Examples of privacy-violating patterns

// ❌ BAD: Fee payer reused in loop
const feePayer = Keypair.generate();
for (const recipient of recipients) {
  await sendTransaction(tx, [wallet, feePayer]);  // REUSED
}

// ❌ BAD: PII in memo
createMemoInstruction("Payment to john@example.com")
