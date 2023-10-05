import React, { useState, useEffect } from "react";
import intlFormatDistance from "date-fns/intlFormatDistance";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "./graphql/mutations";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import * as queries from "./graphql/queries";
import * as subscriptions from "./graphql/subscriptions";
function App({ user, signOut }) {
  const [chats, setChats] = useState([]);


  useEffect(() => {
    async function fetchChats(){
      const allChats = await API.graphql({
        query: queries.listChats,
      });
      console.log(allChats.data.listChats.items);
      setChats(allChats.data.listChats.items);
      }
    
      fetchChats();},
      [])

  useEffect(() => {
    const sub = API.graphql(graphqlOperation(subscriptions.onCreateChat)).subscribe({
      next:({provider, value}) => {
        setChats((prev) => [...prev, value.data.onCreateChat]);

      },
      error: (error) => console.warn(error),
    });

    return () => sub.unsubscribe();

  },[]);

  return (
<div className="bg-gray-100 min-h-screen flex flex-col">
  <div className="bg-indigo-500 py-2 px-4 text-right">
    <button
      type="button"
      className="inline-block bg-indigo-700 hover:bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  </div>

  <div className="flex-grow p-4 overflow-y-auto">
    <div className="w-3/4 mx-auto space-y-4">
      {chats
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((chat) => (
          <div
            key={chat.id}
            className={`p-4 rounded-lg border ${
              chat.email === user.attributes.email ? 'bg-gray-200' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="text-gray-900 font-medium">
                {chat.email.split("@")[0]}
                
              </div>
              <time
                dateTime="2023-01-23T15:56"
                className="text-gray-500 text-xs"
              >
                {intlFormatDistance(new Date(chat.createdAt), new Date())}
              </time>
            </div>
            <div className="mt-2 text-gray-700">
              <p>{chat.text} </p>
            </div>
          </div>
        ))}
    </div>
  </div>

  <div className="bg-white py-4 px-4">
    <div className="relative flex items-center">
      <input
        type="text"
        name="search"
        id="search"
        onKeyUp={async (e) => {
          if (e.key === "Enter") {
            await API.graphql({
              query: mutations.createChat,
              variables: {
                input: {
                  text: e.target.value,
                  email: user.attributes.email,
                },
              },
            });
            e.target.value = "";
          }
        }}
        placeholder="Type your message..."
        className="w-full border rounded-md py-2 pr-10 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
        <kbd
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Send
        </kbd>
      </div>
    </div>
  </div>
</div>


  );
}

export default withAuthenticator(App);
