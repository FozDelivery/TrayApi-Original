import { getDistanceBetween } from "../helpers/getDistanceBetween.js";
import { calculateShippingCost } from "../helpers/calculateShippingCost.js";
import { exception } from "../helpers/exception.js";
import { generateXML } from "../helpers/generateXML.js";
import axios from "axios";

let tokenValue = process.env.TOKEN;
class ShippingController {
  async generateXML(request, response) {
    const { token, cep, cep_destino } = request.query;
    if (!cep || !cep_destino) {
      return response.status(400).json({ message: "CEP de origem e CEP de destino são obrigatórios" });
    }

    const origins = [cep.replace(/\D/g, "")];
    const destinations = [cep_destino.replace(/\D/g, "")];

    const exclusiveDestination = await exception(cep_destino);

    if (exclusiveDestination !== 0) {
      const xml = generateXML(exclusiveDestination);

      return response.status(200).send(xml);

    } else {
     
      try {
        let distance = 0;
        try {
          distance = await getDistanceBetween(origins, destinations);
        } catch {
          const result = await axios.get(`https://api.pagar.me/1/zipcodes/${cep_destino}`);
          const newDestinations = `${result.data.street}, ${result.data.city}, ${result.data.zipcode}, ${result.data.state}`;
          distance = await getDistanceBetween(origins, [newDestinations]);
        }
        const shippingCost = calculateShippingCost(distance);

        if (shippingCost !== 0) {
          const xml = generateXML(shippingCost);

          return response.status(200).send(xml);
        }

        return response.status(400).json({ message: "Distância excedeu o limite do delivery" });
      } catch (error) {
        // TODO: save error to file
        console.log(error);
        return response.status(500).json({ message: "Erro interno no servidor, tente novamente" });
      }
    }
  }
}

export default new ShippingController();
