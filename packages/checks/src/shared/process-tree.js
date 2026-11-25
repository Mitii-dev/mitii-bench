export function terminateTree(child, signal) {
  if (!child) return;
  try {
    if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch {
    // already exited
  }
}

export function stopChild(child) {
  if (!child) return;
  terminateTree(child, "SIGTERM");
  setTimeout(() => terminateTree(child, "SIGKILL"), 1000).unref();
}
