# Modeling Affinity
Modeling affinity as an emergent property derived from the react table.
Here’s how it makes sense mathematically and semantically:
### 1. Conceptual Mapping
•	Every reaction (react) entry represents an interaction between an actor and a context (context_id).
•	Affinity is essentially a summary metric of how much someone resonates with a context or another identity.
•	Thus, affinity = f(reacts) — it’s derived, not stored directly.
##### Example Formula
Let’s say in your react table you have:
###### context_id | target | emoji | timestamp
123        	| abc     |    ❤️    | ...
123        	| abc     |    👍    | ...
123        	| abc     |    👎    | ...
You can define an affinity score like:
```sql
SELECT target,
       AVG(
           CASE emoji
                WHEN '❤️' THEN 1.0
                WHEN '👍' THEN 0.7
                WHEN '👎' THEN -1.0
                ELSE 0
           END
       ) AS affinity_score
FROM react
GROUP BY target;
```

This gives you a normalized affinity metric per target, context, or even per verb.
#### Why This Is Better
•	You don’t need a new table like affinity.
•	It’s composable: any app using this.me can compute affinity however it wants.
•	Different apps can define different scoring functions without touching the protocol.
#### **Integration with this.me**
Later, if you want this.me to expose affinity directly, we can:
	•	Add a virtual view in PostgreSQL called me_affinity.
	•	Or add a computed resolver in GraphQL that calculates affinity on-the-fly using react.