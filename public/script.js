const passwordInput = document.querySelector("#password");
const strengthLabel = document.querySelector("#strength-label");
const strengthBars = document.querySelectorAll(".strength-bars span");

function updatePasswordStrength() {
  if (!passwordInput || !strengthLabel) return;

  const password = passwordInput.value;
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#e2e8f0", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  strengthBars.forEach((bar, index) => {
    bar.style.background = index < score ? colors[score] : "#e2e8f0";
  });

  strengthLabel.textContent = password
    ? `Password strength: ${labels[score]}`
    : "Password strength will appear here.";
}

if (passwordInput) {
  passwordInput.addEventListener("input", updatePasswordStrength);
}

document.querySelectorAll(".show-password").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const input = document.querySelector(`#${targetId}`);

    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    button.textContent = isPassword ? "Hide" : "Show";
  });
});