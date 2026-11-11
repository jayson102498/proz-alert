import moment from "moment-timezone";
import { TimeSet } from "../interface/interfaces";

export const checkIsAvailableTime = (setting: TimeSet[]) => {
  const japanTime = moment().tz("Asia/Tokyo");
  const todayDate = japanTime.day();
  const todaySetting = setting.find(item => item.date === todayDate);

  if (todaySetting) {
    const start = moment(todaySetting.start, "HH:mm");
    const end = moment(todaySetting.end, "HH:mm");
    return japanTime.isBetween(start, end, null, '[]');
  }

  return false;
}