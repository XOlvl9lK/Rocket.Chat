import { Sidebar } from '@rocket.chat/fuselage';
import { useMutableCallback, useOutsideClick } from '@rocket.chat/fuselage-hooks';
import type { VFC, HTMLAttributes } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import tinykeys from 'tinykeys';

import SearchList from '../../search/SearchList';
import GlobalSearchList from '/client/sidebar/search/GlobalSearchList';

const Search: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const [searchOpen, setSearchOpen] = useState(false);

	const ref = useRef<HTMLElement>(null);
	const handleCloseSearch = useMutableCallback(() => {
		setSearchOpen(false);
	});

	// useOutsideClick([ref], handleCloseSearch);

	const openSearch = useMutableCallback(() => {
		setSearchOpen(true);
	});

	useEffect(() => {
		const unsubscribe = tinykeys(window, {
			'$mod+F': (event) => {
				event.preventDefault();
				openSearch();
			},
			'$mod+А': (event) => {
				event.preventDefault();
				openSearch();
			},
			'$mod+P': (event) => {
				event.preventDefault();
				openSearch();
			},
		});

		return (): void => {
			unsubscribe();
		};
	}, [openSearch]);

	return (
		<>
			<Sidebar.TopBar.Action icon='magnifier' onClick={openSearch} {...props} />
			{searchOpen && <GlobalSearchList ref={ref} onClose={handleCloseSearch} />}
		</>
	);
};

export default Search;
