module.exports = function (app, gestorDB) {

    //==========CRUD MENSAJES========================
    /**
     * POST mensaje
     * Crear un nuevo mensaje
     */
    app.post("/api/mensajes", function (req,res) {
        var usuario;
        var token = req.body.token || req.query.token || req.headers['token'];
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                usuario = infoToken.usuario;
            }
        });

        var mensaje = {
            contenido: req.body.contenido,
            fecha: new Date(),
            emisor: usuario,
            destino: req.body.destino,
            leido: false
        };

        var criterio = {
            amigos : { $in : [usuario._id] }
        };

        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null) {
                res.status(500);
                res.json({error: "se ha producido un error"});
            }else{
                var flag = usuarios.find(function(x) {
                    return x.username.localeCompare(mensaje.destino);
                }).length;
                if( flag <= 0){
                    res.status(500);
                    res.json({error: "Se ha producido un error: Usuario destino no es amigo del usuario emisor"});
                }else{
                    gestorDB.addMensaje(mensaje, function (id) {
                        if (id == null) {
                            res.status(500);
                            res.json({error: "Se ha producido un error"});
                        } else {
                            res.status(201);
                            res.json({mensaje: "Mensaje creado correctamente", _id: id, mensaje:mensaje});
                        }
                    });
                }
            }
        });
    });

    /**
     * GET mensaje :id
     */
    app.get("/api/mensajes/:id", function (req, res) {
        var criterio = {"_id": gestorDB.mongo.ObjectId(req.params.id)}
        gestorDB.getMensajes(criterio, function (mensajes) {
            if (post == null) {
                res.status(500);
                res.json({error: "Se ha producido un error"});
            } else {
                res.status(200);
                res.json(JSON.stringify(mensajes[0]));
            }
        });
    });



    //=========USUARIOS Y AUTENTICACION===========================
    /**
     * GET lista de amigos del usuario con token
     */
    app.get("/api/usuarios/amigos", function (req,res) {
        var token = req.body.token || req.query.token || req.headers['token'];
        var id;
        app.get('jwt').verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 24000) {
                res.status(403);// Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                return;
            } else {
                id = infoToken.usuario._id;
            }
        });
        var criterio = {
            amigos : { $in : [id] }
        };

        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null) {
                res.status(500);
                res.json({error: "se ha producido un error"});
            }else{
                res.status(200);
                res.send(JSON.stringify(usuarios));
            }
        });
    });

    /**
     * Autenticacion por token
     */
    app.post("/api/autenticar/", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        var criterio = {
            $or: [
                {username: req.body.username, password: seguro},
                {email: req.body.username, password: seguro}
            ]
        }
        gestorDB.getUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({autenticado: false, mensaje: "Error, usuario o contraseña incorrectos"});
            } else {
                var token = app.get('jwt').sign({usuario: usuarios[0], tiempo: Date.now() / 1000}, "secreto");
                res.status(200);
                res.json({autenticado: true, token: token, usuario: usuarios[0]});
            }
        });
    });
};