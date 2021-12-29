import React, { useState, useEffect } from "react";
import { Alert, FlatList } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "../../hooks/auth";
import { OrderCard, OrderProps } from "../../components/OrderCard";
import { ItemSeparator } from "../../components/ItemSeparator";
import { Container, Header, Title } from "./styles";

export function Orders() {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const { user } = useAuth();

  function handlePizzaDelivery(id: string) {
    Alert.alert('Pedido', 'Confirmar que a pizza foi entregue?', [
      {
        text: 'Não',
        style: 'cancel'
      },
      {
        text: 'Sim',
        onPress: () => {
          firestore().collection('orders').doc(id).update({
            status: 'Entregue'
          });
        }
      }
    ]);
  }

  useEffect(() => {
    const subscribe = firestore()
      .collection('orders')
      .where('waiter_id', '==', user?.id)
      .onSnapshot(querySnapshot => {
        const data = querySnapshot.docs.map(doc => {
          return {
            id: doc.id,
            ...doc.data()
          };
        }) as OrderProps[];
        setOrders(data);
      });

    return () => subscribe();
  }, []);

  return (
    <Container>
      <Header>
        <Title>Pedidos feitos</Title>
      </Header>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <OrderCard
            index={index}
            data={item}
            disabled={item.status === 'Entregue'}
            onPress={() => handlePizzaDelivery(item.id)}
          />
        )}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 125 }}
        ItemSeparatorComponent={() => <ItemSeparator />}
      />
    </Container>
  )
}