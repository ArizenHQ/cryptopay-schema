// Writes the jest results (jest --json) as a Markdown table to the GitHub job summary:
// one section per test file, one line per test, failures with their first message line.
const fs = require("fs");
const path = require("path");

const [resultsFile] = process.argv.slice(2);
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (!resultsFile || !summaryFile) process.exit(0);
if (!fs.existsSync(resultsFile)) {
  fs.appendFileSync(summaryFile, "## Tests\n\nNo jest results: the run stopped before the tests.\n");
  process.exit(0);
}
const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
const icon = { passed: "✅", failed: "❌", pending: "⏭️", skipped: "⏭️", todo: "📝" };
const cell = (text) => String(text).replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n/g, " ");

const lines = [
  `## Tests: ${results.numPassedTests} passed, ${results.numFailedTests} failed, ${results.numTotalTests} total`,
  "",
];
for (const file of results.testResults) {
  const name = path.relative(process.cwd(), file.name);
  const failed = file.assertionResults.filter((t) => t.status === "failed").length;
  lines.push(`### ${failed ? "❌" : "✅"} \`${name}\` — ${file.assertionResults.length - failed}/${file.assertionResults.length}`);
  if (file.status === "failed" && !file.assertionResults.length) {
    lines.push("", "```", cell(file.message).slice(0, 1000), "```");
  }
  lines.push("", "| | Test | Time |", "|---|---|---|");
  for (const t of file.assertionResults) {
    const title = [...t.ancestorTitles, t.title].join(" › ");
    const why = t.status === "failed" ? `<br>${cell((t.failureMessages[0] || "").split("\n").find(Boolean) || "")}` : "";
    lines.push(`| ${icon[t.status] || t.status} | ${cell(title)}${why} | ${t.duration ?? 0} ms |`);
  }
  lines.push("");
}
fs.appendFileSync(summaryFile, lines.join("\n") + "\n");
