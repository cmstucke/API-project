const GroupImages = ({ group }) => {
  return (
    <div className='img-container'>
      {
        group.previewImage &&
        group.previewImage.startsWith('group-img-') &&
        <img
          src={require(`../../assets/images/${group.previewImage}`)}
          alt={group.previewImage}
          className='group-img'
        />
      }
      {
        group.previewImage &&
        !group.previewImage.startsWith('group-img-') &&
        <img
          src={group.previewImage}
          alt={group.previewImage}
          className='group-img'
        />
      }
    </div>
  );
};

export default GroupImages;
