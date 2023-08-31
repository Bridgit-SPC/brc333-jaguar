export function Tweet({ name, username, text }) {
  return (
    <div className="tweet">
      <img 
        src={user.profileImage}
        alt={`${name}'s profile`} 
      />

      <div>
        <span>{name}</span>
        <span>@{username}</span>

        <p>{text}</p>

        <div>
          {/* icons */}
        </div>
      </div>
    </div>
  )
}
