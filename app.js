const http = require("http");
const PORT = 8080;

// Function which handles requests and sends response
const requestHandler = function(request, response) {
    if (request.url === "/") {
        response.end("Welcome!");
    } else if (request.url === "/urls") {
        response.end("cnn.com");
    } else {
        response.statusCode = 404;
        response.end("404 Page Not Fund");
    }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});