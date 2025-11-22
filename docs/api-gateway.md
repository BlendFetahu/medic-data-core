Ky shërbim përdoret si entry point për të gjitha kërkesat HTTP.

Detyrat kryesore

Pranon kërkesa nga frontendi

Dërgon kërkesat drejt Auth Service ose Hospital Service

Ben forwarding të përgjigjeve

Kontrollon statuset dhe error handling

Teknologjitë

Node.js

Express

Docker

HTTP proxy pattern

Variablat e mjedisit (.env)
PORT=5000
AUTH_SERVICE_URL=http://auth-service:5001
HOSPITAL_SERVICE_URL=http://hospital-service:5002