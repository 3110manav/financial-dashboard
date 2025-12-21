import React from "react";

type Props = {
  if: boolean;
  children: React.ReactNode;
};

export const Render: React.FC<Props> = (props: Props) => {
  return props.if ? props.children : <></>;
};