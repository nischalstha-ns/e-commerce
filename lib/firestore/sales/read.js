"use client";

import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import useSWR from "swr";

const fetcher = async (key) => {
  const [_, queryType] = key;
  
  if (queryType === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    
    const q = query(
      collection(db, "sales"),
      where("timestamp", ">=", todayTimestamp),
      orderBy("timestamp", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  if (queryType === "recent") {
    const q = query(
      collection(db, "sales"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  return [];
};

export function useTodaySales() {
  const { data, error, isLoading } = useSWR(["sales", "today"], fetcher);
  return { data, error, isLoading };
}

export function useRecentSales() {
  const { data, error, isLoading } = useSWR(["sales", "recent"], fetcher);
  return { data, error, isLoading };
}
