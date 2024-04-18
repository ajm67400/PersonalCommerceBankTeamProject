import { Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import "./HomePageCard.scss";
import usePrivilege from '../../../../hooks/user-privilege-hook';
import { Role } from '../../../ip-whitelist-tracker-types';

export interface CardAction {
  buttonText: string,
  href: string,
}
const HomePageCard = ({ title, buttons, privilege }: {
  title: string,
  buttons: CardAction[],
  privilege?: Role,
}) => {
  const navigate = useNavigate();

  if (privilege) {
    // dont show this card if they dont have perms to view
    // i.e. user shouldnt see the admin "Manage Users" card
    const allowed = usePrivilege([privilege]);
    if (!allowed) return null;
  }

  return (
    <div className="home-page-card">
      <div className="title-area">
        <h2>{title || "Title"}</h2>
      </div>
      <div className="content-area">
        {buttons.map((action: CardAction, key: number) => {
          return (
            <Button key={key} onClick={() => navigate(action.href)} className="card-action-btn">
              {action.buttonText}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default HomePageCard
