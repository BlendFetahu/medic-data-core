Architecture Overview — Medic Data Core

Projekti është i bazuar në një arkitekturë microservices, e ndarë në tre shërbime kryesore:

API Gateway – hyrja që pranon të gjitha kërkesat nga frontendi.

Auth Service – menaxhon autentikimin, regjistrimin, login, tokenet JWT.

Hospital Service – menaxhon të dhënat e pacientëve, doktorëve, vizitave, statistikave.

Këto shërbime komunikojnë përmes një rrjeti të ndërtuar nga Docker, duke përdorur hostname të brendshëm (auth-service, hospital-service, mysql, redis).

Komponentët kryesorë të arkitekturës
API Gateway -	Shërbimi hyrës që dërgon kërkesat drejt microservices të tjera.
Auth Service	- Autentikim dhe autorizim me JWT.
Hospital Service	- Logjikë biznesi, pacientë, vizita, diagnoza, statistika.
MySQL	- Shërbimi i bazës së të dhënave.
Redis -	Cache për performancë.
Docker Compose -	Menaxhon ngritjen e të gjithë sistemit.