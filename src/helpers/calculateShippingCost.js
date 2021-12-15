export function calculateShippingCost(distance) {
  const distanceInKilometers = distance / 1000;

  let shippingCost = 0;

  for (let i = 0; i < distanceInKilometers + 1; i++) {
    const factor = i > 5 ? 5.99 : 4.99;

    if (distanceInKilometers <= i) shippingCost = i + factor;
  }

  return parseFloat(shippingCost.toFixed(2));
}
