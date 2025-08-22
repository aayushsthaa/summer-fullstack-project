function MyInformation({id,name,userName,email,role}:{id:string,name:string,userName:string,email?:string ,role?:string}/*  ? suggests that the value is not important  or it can le left out */) {
  return (
    <div className="mb-4">
      <h2 id='custom' className="custom-heading">{name}'s  information</h2>
      <p>id: {id}</p>
      <p>Name: {name}</p>
      <p>Username: {userName}</p>
      {email?<p>Email: {email}</p>:<p>No email</p>}
      <p>Role: {role}</p>
    </div>
  );
}

export default MyInformation;

