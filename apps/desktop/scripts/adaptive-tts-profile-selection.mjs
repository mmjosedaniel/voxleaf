export async function selectAdaptiveTtsAlternateProfile({
  driver,
  profileId,
  waitForCondition,
  assert,
  timeoutMs,
  now = Date.now,
}) {
  const deadline = now() + timeoutMs;
  const remaining = () => Math.max(0, deadline - now());
  const failure = "Native synchronized narration proof failed.";
  const alternate = await driver.execute(
    `const profileId = ${JSON.stringify(profileId)};
     const inputs = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     );
     const input = inputs.find((candidate) => candidate.value !== profileId);
     if (!(input instanceof HTMLInputElement)) {
       return false;
     }
     const active = document.querySelector(".hardware-compatibility")
       ?.getAttribute("data-compatibility-profile");
     return { profileId: input.value, changed: active !== input.value };`,
  );
  assert(
    typeof alternate?.profileId === "string" && alternate.profileId.length > 0,
    failure,
  );
  if (alternate.changed !== true) {
    return alternate;
  }
  const serializedAlternate = JSON.stringify(alternate.profileId);
  await waitForCondition(
    driver,
    `const input = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     ).find((candidate) => candidate.value === ${serializedAlternate});
     return input instanceof HTMLInputElement && !input.matches(":disabled");`,
    remaining(),
  );
  const switched = await driver.execute(
    `const input = Array.from(
       document.querySelectorAll('input[name="hardware-profile"]'),
     ).find((candidate) => candidate.value === ${serializedAlternate});
     if (!(input instanceof HTMLInputElement)) {
       return false;
     }
     const active = document.querySelector(".hardware-compatibility")
       ?.getAttribute("data-compatibility-profile");
     const changed = active !== input.value;
     if (changed) {
       if (input.matches(":disabled")) {
         return false;
       }
       input.click();
     }
     return { profileId: input.value, changed };`,
  );
  assert(
    typeof switched?.profileId === "string" && switched.profileId.length > 0,
    failure,
  );
  if (switched.changed === true) {
    await waitForCondition(
      driver,
      `return document.querySelector(".hardware-compatibility")
         ?.getAttribute("data-compatibility-profile") === ${serializedAlternate};`,
      remaining(),
    );
  }
  return switched;
}
