### Neural Networks - **One-Hot Encoding**
--------
To represent the combinations of **“me, you, him, her, it, us, them”** in a neural network, we need to convert the elements into a suitable format for neural network processing, such as one-hot encoding, and design a neural network architecture that can process these inputs.

Here’s a step-by-step approach to achieve this:
1.	**One-Hot Encoding:** Convert each element (“me”, “you”, “him”, “her”, “it”, “us”, “them”) into a one-hot encoded vector.
2.	**Combination Representation:** Create input vectors for each combination by combining the one-hot encoded vectors.
3.	**Neural Network Design:** Design a simple neural network to process these input vectors.

#### Step 1: One-Hot Encoding
One-hot encoding represents each element as a binary vector with a single high (1) value and the rest low (0). For the elements “me”, “you”, “him”, “her”, “it”, “us”, “them”, we can assign the following one-hot encoded vectors:

```js
// Create Me instances
const meInstance = new Me('me');
const youInstance = new Me('you');
const himInstance = new Me('him');
const herInstance = new Me('her');
const itInstance = new Me('it');
const usInstance = new Me('us');
const themInstance = new Me('them');

// One-hot encoding representation
const subjects = {
  'me': [1, 0, 0, 0, 0, 0, 0],
  'you': [0, 1, 0, 0, 0, 0, 0],
  'him': [0, 0, 1, 0, 0, 0, 0],
  'her': [0, 0, 0, 1, 0, 0, 0],
  'it': [0, 0, 0, 0, 1, 0, 0],
  'us': [0, 0, 0, 0, 0, 1, 0],
  'them': [0, 0, 0, 0, 0, 0, 1]
};
```

#### Step 2: Combination Representation
For each combination, we can create an input vector by combining the one-hot encoded vectors of its elements. For example:
Combination “me, you” would be represented as the sum of the one-hot vectors for “me” and “you”:

```
[1, 0, 0, 0, 0, 0, 0] + [0, 1, 0, 0, 0, 0, 0] = [1, 1, 0, 0, 0, 0, 0]
```
---
### Me Deviation Formula
**How Spread Out the data Points are around the .me?**