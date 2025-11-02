import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
export const getAdminEmails = async (): Promise<string[]> => {
  const snap = await getDocs(collection(db, "admin"));
  const docsData = snap.docs.map((d) => d.data());
  const emails = docsData.length ? docsData[0].adminEmails : [];
  return emails;
};

export const getSheetList = async () => {
  const snap = await getDocs(collection(db, "sheets"));
  const docs = snap.docs.map((d) => ({ id: d.id, meta: d.data() }));
  const clientMap = docs.map((d) => ({
    id: d.id as string,
    name: (d.meta.title as string) || "Unnamed Client",
    industry: (d.meta.industry as string) || "Unknown Industry",
  }));
  return clientMap;
};

//10jYRqIjtAjtz7Y5Ds6O0Kv6rjNeIIqj1ubNwzq82jvg test
// 12PSXSeF7V7S7VyxbqhVYe1GEDttUQiw1pndU54uUpHY  company 2
// 1HLT7wyOs_uGbxDTYCGpyiz2eTPbATMYquDm4RQ5pZHU company 3
// 1XiLrfSD9aPtjerRYwaiZbiIbQU_lMGPFM32-YzQDT4c  Artifact Design
// 1g9QHVSD7Eyv2m2qwKWMYRzALNLjf2YOb2M2MGAODD-4   Artifact Design internal
// 1kmENU7TjhZzKbGapx3IyHtOKmGeecydc0yonr7ss8tQ Company 1
