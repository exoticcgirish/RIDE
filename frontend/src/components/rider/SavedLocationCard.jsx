const SavedLocationCard = ({
  title = 'Saved Place',
  address = 'No address provided',
  onSelect = () => {},
  onDelete = () => {},
}) => {
  return (
    <div className='saved-location-card'>
      <div className='saved-location-content'>
        <h3>{title}</h3>
        <p>{address}</p>
      </div>

      <div className='saved-location-actions'>
        <button type='button' onClick={onSelect} className='select-btn'>
          Select
        </button>
        <button type='button' onClick={onDelete} className='delete-btn'>
          Delete
        </button>
      </div>
    </div>
  );
};

export default SavedLocationCard;
