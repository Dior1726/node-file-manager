export const getUsername = () => {
  const arg = process.argv.find((a) => a.startsWith("--username="));
  if (!arg) return null;
  return arg.split("=")[1] || null;
};
