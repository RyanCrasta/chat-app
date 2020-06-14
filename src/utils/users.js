// keeping track of users in an array

const users = [];

// add user

const addUser = ({id, username, room}) => {
    // id is something that is associated with individual socket


    // clean the data

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data

    if(!username || !room){
        return{
            error: 'Username and Room are required'
        }
    }

    // check for existing user

    const existingUser = users.find((user) => {
        return (user.room === room && user.username === username);
    })

    // validate username
    if(existingUser){
        return{
            error: 'Username is in use'
        }
    }

    // store user
    const user = {id, username, room}

    users.push(user);

    return({user});
}


// remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return(user.id === id)
    })

    // index will be -1 if no matches found
    // index will be 0 or greater if match is found

    if(index !== -1){
        // splice allows to remove items from an array using index
        // .splice(index, number of items u wannna remove)
        // returns an array so we want object at index 0 of that array
       
        return(users.splice(index, 1)[0])
    }


}

// getUser

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return(user.id === id)
    })    

    if(index !== -1){
        return(users[index]);
    }
    else{
        return(undefined);
    }
}


// getUsersInRoom
const getUsersInRoom = (room) => {
    const result = users.filter((user) => {
        return(user.room === room)
    })
    return result;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
