import { v4 as uuidv4 } from "uuid";

const generateApiKey = (): string => {
  return uuidv4();
};