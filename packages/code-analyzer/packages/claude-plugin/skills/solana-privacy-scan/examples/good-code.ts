// Examples of privacy-safe patterns

// ✅ GOOD: Unique fee payer per transaction
for (const recipient of recipients) {
  const feePayer = Keypair.generate();  // Inside loop
  await sendTransaction(tx, [wallet, feePayer]);
}

// ✅ GOOD: Generic memo
createMemoInstruction("Payment")
