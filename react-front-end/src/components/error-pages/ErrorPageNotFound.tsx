
const ErrorPageNotFound = ({ title, message }: {
  title?: string,
  message?: string,
}) => {
  return (
    <div 
      style={{display: "flex", flexDirection: "column", textAlign: "center"}} 
      className='page-not-found'
    >
      <h1 style={{fontSize: "5em", fontWeight: "bold"}}>{ title || "Error" }</h1>
      <p>{ message || "Page doesn't exist or there was a problem displaying this page" }</p>
    </div>
  )
}

export default ErrorPageNotFound
