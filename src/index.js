const http = require('http');
const fs = require('fs');
const url = require('url');


http.createServer((req, res) => {

    function deleteHandler(userName) {
        readFile((users) => {
            delete users[userName];
            saveFile(users, () => {
                res.write(`user ${userName} deleted`)
                res.end();
            })
        })
    }
    function getHandler(userName) {
        readFile((users) => {
            if (userName) {
                let existingUserData = users[userName];
                if (existingUserData !== undefined) {
                    existingUserData.username = userName;
                    res.write(JSON.stringify(existingUserData));
                }
                else { res.write('no such user') };
            }
            else {
                res.write(JSON.stringify(users));
            }
            res.end();
        });
    }
    function putHandler(userName, data) {
        data = JSON.parse(data.toString());
        readFile((users) => {
            users[userName] = data;
            saveFile(users, () => {
                res.write(`user ${userName} created`);
                res.end();
            });
        });
    }
    function postHandler(userName, newUserName) {

        readFile((users) => {
            users[newUserName] = users[userName];
            delete users[userName];
            saveFile(users, () => {
                res.write(`user ${userName} updated to ${newUserName}`)
                res.end();
            })
        })
    }
    // ----------------------------------------------------------------
    const currentReq = url.parse(req.url, true);

    if (currentReq.pathname === '/users') {
        let userName = currentReq.query.username;

        if (req.method === 'PUT') {
            req.on('data', (data) => {
                putHandler(userName, data);
            });
        }
        else if (req.method === 'POST') {
            let newUserName = currentReq.query.newUserName;
            postHandler(userName, newUserName);
        }
        else if (req.method === 'GET') {
            getHandler(userName);
        }
        else if (req.method === 'DELETE') {
            deleteHandler(userName)
        }
    }
}).listen(4000);







function saveFile(content, cb) {
    fs.writeFile('./src/db.json', JSON.stringify(content), cb);
}


function readFile(cb) {
    fs.readFile('./src/db.json', { encoding: 'utf-8' }, (err, content) => {
        cb(JSON.parse(content));
    });
}

console.log('Listening on: http://localhost:4000');