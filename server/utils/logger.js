// Tiny dependency-free structured logger.
//
// - Pretty, colorless console output in development.
// - One JSON object per line in production (easy for log drains like
//   Render/Logtail/Datadog to parse).
// - Level threshold via LOG_LEVEL (debug|info|warn|error); defaults to
//   "debug" in development and "info" in production.
//
// The method signatures mirror console.* so call sites read naturally:
//   logger.error("Error in login:", err)
//   logger.info("Server ready", { port })

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

const isProduction = process.env.NODE_ENV === "production";
const configured = process.env.LOG_LEVEL && LEVELS[process.env.LOG_LEVEL];
const threshold = configured || (isProduction ? LEVELS.info : LEVELS.debug);

function serialize(value) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(level, message, extra) {
  if (LEVELS[level] < threshold) return;

  if (isProduction) {
    const line = { level, time: new Date().toISOString(), msg: String(message) };
    if (extra.length) line.details = extra.map(serialize);
    process.stdout.write(`${JSON.stringify(line)}\n`);
    return;
  }

  // Development: human-readable, route warn/error to stderr.
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  sink(`[${level.toUpperCase()}] ${message}`, ...extra);
}

const logger = {
  debug: (message, ...extra) => emit("debug", message, extra),
  info: (message, ...extra) => emit("info", message, extra),
  warn: (message, ...extra) => emit("warn", message, extra),
  error: (message, ...extra) => emit("error", message, extra),
};

export default logger;
