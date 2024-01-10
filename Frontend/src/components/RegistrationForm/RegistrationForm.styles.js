import { css } from 'lit';

export const RegistrationFormStyles = css`
/* Style for form container */

#form{
  width:400px;
  margin:3vh auto 0 auto;
  background-color: whitesmoke;
  border-radius: 5px;
  padding:30px;
}

h1{
  text-align: center;
  color:#792099;
}

#form button{
  background-color: #792099;
  color:white;
  border: 1px solid #792099;
  border-radius: 5px;
  padding:10px;
  margin:20px 0px;
  cursor:pointer;
  font-size:20px;
  width:100%;
}

.input-group{
  display:flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-group input{
  border-radius: 5px;
  font-size:12px;
  margin-top:5px;
  padding:10px;
  border:1px solid rgb(34,193,195) ;
}

.input-group select{
  border-radius: 5px;
  font-size:12px;
  margin-top:5px;
  padding:10px;
  border:1px solid rgb(34,193,195) ;
}


.input-group input:focus{
  outline:0;
}

.input-group .error{
  color:rgb(242, 18, 18);
  font-size:16px;
  margin-top: 5px;
}

.input-group.success input{
  border-color: #0cc477;
}

.input-group.error input{
  border-color:rgb(206, 67, 67);
}`;
