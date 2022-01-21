import React from "react";
import {
  ApolloClient,    //manage both local and remote data with GraphQL ,
  InMemoryCache,   //cache is an instance of InMemoryCache, which Apollo Client uses to cache query results after fetching them.
  ApolloProvider,  //To connect Apollo Client to React, you will need to use the (ApolloProvider component),It wraps your React app and places the client on the context, which allows you to access it from anywhere in your component tree.
  useSubscription, //In the majority of cases, your client should not use subscriptions to stay up to date with your backend.
  useMutation,     //send updates to your GraphQL server with the useMutation hook.
  gql,             //It is used for passing a query to server.
} from "@apollo/client";  //This single package contains virtually everything you need to set up Apollo Client.

//Import and initialize a WebSocketLink object in the same project file where you initialize ApolloClient
import { WebSocketLink } from "@apollo/client/link/ws";

//Shards React is a useful UI library that lets us add many components easily into our React app
import { Container, Row, Col, FormInput, Button } from "shards-react";

/*To execute subscriptions over WebSocket,
 you can add a WebSocketLink to your link chain.
This link requires the subscriptions-transport-ws library */
const link = new WebSocketLink({
  uri: `ws://localhost:4000/`,      //address of the port needs to be connected..
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),       //Helps to render the data for repeated quires.
});

//(gql)It is used for passing a query to server.
const GET_MESSAGES = gql`         
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql`
  mutation($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) {
    return null;
  }

  //Here we Rendering the data by using map function
  return (
    <>
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          style={{
            display: "flex",
            justifyContent: user === messageUser ? "flex-end" : "flex-start",
            paddingBottom: "1em",
          }}
        >
          {user !== messageUser && (
            <div
              style={{
                height: 50,
                width: 50,
                marginRight: "0.5em",
                border: "2px solid #e5e6ea",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "18pt",
                paddingTop: 5,
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? "blue" : "red",
              color: user === messageUser ? "white" : "black",
              padding: "1em",
              borderRadius: "1em",
              maxWidth: "60%",
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  );
};

const Chat = () => {
  const [state, stateSet] = React.useState({   //here we initializing the state
    user: "Achyuth",
    content: "",
  });
  const [postMessage] = useMutation(POST_MESSAGE);

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({
        variables: state,
      });
    }
    stateSet({
      ...state,             //unpacking  and updating the new data to state
      content: "", 
    });
  };
  return (
    <Container>
      <Messages user={state.user} />
      <Row>
        <Col xs={2} style={{ padding: 0 }}>
          <FormInput
            label="User"
            value={state.user}
            onChange={(evt) =>
              stateSet({
                ...state, 
                user: evt.target.value,
              })
            }
          />
        </Col>
        <Col xs={8}>
          <FormInput
            label="Content"
            value={state.content}
            onChange={(evt) =>
              stateSet({
                ...state,
                content: evt.target.value,
              })
            }
            onKeyUp={(evt) => {
              if (evt.keyCode === 13) {    //key 13 keycode is for ENTER key
                onSend();
              }
            }}
          />
        </Col>
        <Col xs={2} style={{ padding: 0 }}>
          <Button onClick={() => onSend()} style={{ width: "100%" }}>
            Send
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
);