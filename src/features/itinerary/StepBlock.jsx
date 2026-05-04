import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const StepBlock = ({ step, top, actualHeight, hasAbove, hasBelow, isHovered, onHover, onClick, createUrl, navigate }) => {
    const labelFits = actualHeight >= 18;
    const needsExpansion = isHovered && !labelFits;
    const height = needsExpansion ? 24 : actualHeight;
    const aboveLocationId = step.route ? step.route.originLocationId : step.locationId;
    const belowLocationId = step.route ? step.route.destinationLocationId : step.locationId;
    const pIds = (step.participantIds || []).join(',');

    return (
        <Box
            onClick={() => onClick(step)}
            onMouseEnter={() => onHover(step.id)}
            onMouseLeave={() => onHover(null)}
            sx={{
                position: 'absolute',
                top,
                left: 4,
                right: 4,
                height,
                borderRadius: '6px',
                border: '1px solid',
                zIndex: isHovered ? 2 : 1,
                borderColor: isHovered ? 'primary.main' : 'divider',
                backgroundColor: needsExpansion ? 'background.paper' : isHovered ? 'action.selected' : 'action.hover',
                boxShadow: isHovered ? '0 0 8px 2px rgba(144,202,249,0.4)' : 'none',
                cursor: 'pointer',
                px: 1,
                transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s, height 0.15s',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {(labelFits || needsExpansion) && (
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {step.name}
                </Typography>
            )}
            {isHovered && !hasAbove && step.startTimeId && (
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`${createUrl}?endTimeId=${step.startTimeId}${aboveLocationId ? `&locationId=${aboveLocationId}` : ''}${pIds ? `&participantIds=${pIds}` : ''}`); }}
                    sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', zIndex: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
            {isHovered && !hasBelow && step.endTimeId && (
                <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); navigate(`${createUrl}?startTimeId=${step.endTimeId}${belowLocationId ? `&locationId=${belowLocationId}` : ''}${pIds ? `&participantIds=${pIds}` : ''}`); }}
                    sx={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', width: 24, height: 24, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'divider', zIndex: 1, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                    <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
        </Box>
    );
};

export default StepBlock;
