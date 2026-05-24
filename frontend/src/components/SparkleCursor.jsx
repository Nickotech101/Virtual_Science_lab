export default function enableSparkleCursor() {
  console.log("✨ SparkleCursor initialized"); // debug log

  document.addEventListener("mousemove", (e) => {
    console.log("✨ sparkle created"); // debug log

    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;

    document.body.appendChild(sparkle);

    setTimeout(() => {
      sparkle.remove();
    }, 400);
  });
}
