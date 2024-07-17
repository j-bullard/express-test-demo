const server = require("./app");
const port = 3000;

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
