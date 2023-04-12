import { Sidebar } from '@rocket.chat/fuselage';
import { useMutableCallback, useOutsideClick } from '@rocket.chat/fuselage-hooks';
import type { VFC, HTMLAttributes } from 'react';
import React, { useState, useEffect, useRef, useContext } from 'react';
import tinykeys from 'tinykeys';

import SearchList from '../../search/SearchList';
import GlobalSearchList from '/client/sidebar/search/GlobalSearchList';
import { SidebarWidthContext } from '/client/sidebar/Sidebar';

const Search: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const sidebarWidthContext = useContext(SidebarWidthContext)

	const ref = useRef<HTMLElement>(null);
	const handleCloseGlobalSearch = useMutableCallback(() => {
		setGlobalSearchOpen(false);
		sidebarWidthContext.setWidth(300);
	});
	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
	});

	// useOutsideClick([ref], handleCloseSearch);

	const openGlobalSearch = useMutableCallback(() => {
		setGlobalSearchOpen(true);
		sidebarWidthContext.setWidth(560);
	});

	const openSearch = useMutableCallback(() => {
		setSearchOpen(true);
	});

	useEffect(() => {
		const unsubscribe = tinykeys(window, {
			'$mod+F': (event) => {
				event.preventDefault();
				openGlobalSearch();
			},
			'$mod+А': (event) => {
				event.preventDefault();
				openGlobalSearch();
			},
			'$mod+P': (event) => {
				event.preventDefault();
				openGlobalSearch();
			},
			'$mod+K': (event) => {
				event.preventDefault();
				openSearch();
			},
			'$mod+Л': (event) => {
				event.preventDefault();
				openSearch();
			},
		});

		return (): void => {
			unsubscribe();
		};
	}, [openGlobalSearch]);

	return (
		<>
			<Sidebar.TopBar.Action icon='magnifier' onClick={openGlobalSearch} {...props} />
			{globalSearchOpen && <GlobalSearchList ref={ref} onClose={handleCloseGlobalSearch} />}
			{searchOpen && <SearchList ref={ref} onClose={handleCloseSearch} />}
		</>
	);
};

export default Search;
