Projekti përdor Docker për:

Izolimin e microservices

Lidhjen e shërbimeve përmes rrjetit internal

Deploy të qartë dhe të përsëritshëm

| Shërbimi         | Porta       | Përshkrimi         |
| ---------------- | ----------- | ------------------ |
| api-gateway      | 5000        | Entry point        |
| auth-service     | 5001        | Autentikim         |
| hospital-service | 5002        | Menaxhimi spitalor |
| mysql            | 3307 → 3306 | Bazë të dhënash    |
| redis            | 6379        | Cache              |

Komanda për nisje
docker compose up --build

Komanda për ndalje
docker compose down