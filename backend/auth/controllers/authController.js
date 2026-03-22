const authService = require("../services/authService");

const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => resolve(JSON.parse(body)));
  });
};

const register = async (req, res) => {
  try {
    const { email, password } = await parseBody(req);
    //console.log(email);
    //console.log(password);
    const user = await authService.register(email, password);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
  } catch (err) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: err.message }));
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = await parseBody(req);
    //console.log(email);
    //console.log(password);

    const token = await authService.login(email, password);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ token }));
  } catch (err) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: err.message }));
  }
};

const verify = async(req, res)=>{
  try{
    const payload = await authService.verify(req);
    if(payload){
      res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
    }else{
      res.writeHead(401);
    res.end(JSON.stringify({ "error":"payload empty" }));
    }
  }catch (err) {
    res.writeHead(401);
    res.end(JSON.stringify({ error: err.message }));
  }
}

module.exports = { register, login,verify };